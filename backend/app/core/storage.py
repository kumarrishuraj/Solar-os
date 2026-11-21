"""File Storage Module.

Handles file validation, unique naming, and storage in Supabase Storage
or fallback local filesystem storage.
"""

import os
import re
import uuid
from typing import Tuple
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


def sanitize_filename(filename: str) -> str:
    """Sanitize original filename to remove path traversal or unsafe characters."""
    clean = re.sub(r"[^\w\.-]", "_", os.path.basename(filename))
    return clean[:100]


class StorageService:
    """Abstracts file storage operations."""

    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(
        self,
        file: UploadFile,
        subfolder: str = "assessments",
    ) -> Tuple[str, str, int, str]:
        """Validate, persist file and return (file_path, file_name, file_size_bytes, mime_type)."""
        content_type = file.content_type or "application/octet-stream"

        if content_type not in settings.ALLOWED_IMAGE_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{content_type}'. Allowed: {settings.ALLOWED_IMAGE_MIME_TYPES}",
            )

        content = await file.read()
        file_size = len(content)

        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB",
            )

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty file upload not permitted",
            )

        original_name = sanitize_filename(file.filename or "upload.bin")
        unique_prefix = uuid.uuid4().hex[:12]
        safe_name = f"{unique_prefix}_{original_name}"

        # If Supabase Storage client is configured, upload there
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client

                client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
                storage_path = f"{subfolder}/{safe_name}"
                client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).upload(
                    path=storage_path,
                    file=content,
                    file_options={"content-type": content_type},
                )
                return storage_path, original_name, file_size, content_type
            except Exception as e:
                # Log and fallback to local filesystem
                pass

        # Local storage fallback
        dest_dir = os.path.join(self.upload_dir, subfolder)
        os.makedirs(dest_dir, exist_ok=True)
        local_path = os.path.join(dest_dir, safe_name)
        with open(local_path, "wb") as f:
            f.write(content)

        # Return standardized relative path
        rel_path = f"{subfolder}/{safe_name}".replace("\\", "/")
        return rel_path, original_name, file_size, content_type

    def delete_file(self, file_path: str) -> bool:
        """Remove file from storage if present."""
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client

                client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
                client.storage.from_(settings.SUPABASE_STORAGE_BUCKET).remove([file_path])
                return True
            except Exception:
                pass

        local_path = os.path.join(self.upload_dir, file_path)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                return True
            except OSError:
                return False
        return True


storage_service = StorageService()

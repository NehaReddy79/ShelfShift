from app.database import Base
from sqlalchemy.orm import mapped_column, Mapped , relationship
from sqlalchemy import Column , ForeignKey, DateTime , String, Integer
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id : Mapped[int] = mapped_column(primary_key=True, nullable=False)
    email : Mapped[str] = mapped_column(unique=True , nullable=False)
    hashed_password : Mapped[str] = mapped_column(nullable=False)
    created_at : Mapped[datetime] = mapped_column(DateTime , default=datetime.utcnow, nullable=False)
    jobs : Mapped[list["Job"]] = relationship(back_populates="user")


class Job(Base):
    __tablename__ = "jobs"
    id : Mapped[int] = mapped_column(primary_key=True, nullable=False)
    user_id : Mapped[int] = mapped_column(ForeignKey("users.id"))
    status : Mapped[str] = mapped_column()
    source_format : Mapped[str] = mapped_column()
    target_format : Mapped[str] = mapped_column()
    created_at : Mapped[datetime] = mapped_column(DateTime , default=datetime.utcnow , nullable=False)
    completed_at : Mapped[datetime] = mapped_column(DateTime , nullable=True)
    error_message : Mapped[str] = mapped_column(nullable=True)
    user : Mapped["User"] = relationship(back_populates="jobs")
    files : Mapped[list["File"]] = relationship(back_populates="job")


class File(Base):
    __tablename__ = "files"
    id : Mapped[int] = mapped_column(primary_key=True, nullable=False)
    job_id : Mapped[int] = mapped_column(ForeignKey("jobs.id"))
    file_type : Mapped[str] = mapped_column()
    original_filename : Mapped[str] = mapped_column()
    storage_path : Mapped[str] = mapped_column()
    file_size : Mapped[int] = mapped_column()
    created_at : Mapped[datetime] = mapped_column(DateTime , default=datetime.utcnow)
    job: Mapped["Job"] = relationship(back_populates="files")


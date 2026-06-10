from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    openalex_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    authors = Column(JSON, nullable=True)  # List of author names stored as JSON
    publication_year = Column(Integer, nullable=True)
    citation_count = Column(Integer, default=0)
    paper_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

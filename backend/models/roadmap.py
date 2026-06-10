import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, unique=True, index=True, nullable=False)
    roadmap_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from db.session import get_db
from models.models import Comment, Project, User
from schemas.schemas import CommentCreate, Comment as CommentSchema
from core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=CommentSchema)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == comment.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user exists
    user = db.query(User).filter(User.id == comment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_comment = Comment(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/", response_model=List[CommentSchema])
def read_comments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comments = db.query(Comment).offset(skip).limit(limit).all()
    return comments

@router.get("/{comment_id}", response_model=CommentSchema)
def read_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(db_comment)
    db.commit()
    return {"message": "Comment deleted successfully"} 
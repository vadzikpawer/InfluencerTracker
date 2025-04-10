import pytest
import os
from sqlalchemy import inspect, text

def test_database_connection(db_session):
    """Test that the database connection is working and using SQLite."""
    # Ensure we're in test mode
    assert os.environ.get("TESTING") == "True"
    
    # Get the engine inspector
    inspector = inspect(db_session.bind)
    
    # Verify it's an SQLite database
    assert 'sqlite' in str(db_session.bind.url).lower()
    
    # Make a simple query to verify connection
    result = db_session.execute(text("SELECT 1")).scalar()
    assert result == 1 
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AccessLog(BaseModel):
    id: str
    user_id: str
    object_id: str
    action: str
    timestamp: datetime = Field(default_factory=datetime.now)
    allowed: bool
    reason: str
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "object_id": self.object_id,
            "action": self.action,
            "timestamp": self.timestamp.isoformat(),
            "allowed": self.allowed,
            "reason": self.reason
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'AccessLog':
        timestamp = data.get("timestamp")
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)
        
        return cls(
            id=data.get("id"),
            user_id=data.get("user_id"),
            object_id=data.get("object_id"),
            action=data.get("action"),
            timestamp=timestamp,
            allowed=data.get("allowed"),
            reason=data.get("reason")
        )

if __name__ == "__main__":
    log = AccessLog(id="1", user_id="Victor", object_id="file", action="read", allowed=True, reason="test")
    print(log.to_dict())
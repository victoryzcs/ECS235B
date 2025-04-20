from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class Dataset(BaseModel):
    id: str
    name: str
    description: str = ""
    objects: List[str] = Field(default_factory=list) # List of object IDs
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "objects": self.objects
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Dataset':
        return cls(
            id=data.get("id"),
            name=data.get("name"),
            description=data.get("description", ""),
            objects=data.get("objects", [])
        )

if __name__ == "__main__":
    dataset = Dataset(id="1", name="Test Dataset", description="A test dataset woohoo", objects=["obj001", "obj002"])
    print(dataset.to_dict())
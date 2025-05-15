from typing import List, Dict, Any
from .base_model import BaseModel

class Dataset(BaseModel):
    def __init__(self, id: str, name: str, description: str = None, objects: List[str] = None):
        self.id = id
        self.name = name
        self.description = description
        self.objects = objects if objects is not None else []

    def to_dict(self) -> Dict[str, Any]:
        return {
            '_id': self.id,
            'name': self.name,  
            'description': self.description,
            'objects': self.objects
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Dataset':
        if not data:
            return None
        return cls(
            id=data['_id'],
            name=data.get('name'),
            description=data.get('description'),
            objects=data.get('objects', [])
        )

if __name__ == "__main__":
    dataset = Dataset(id="1", name="Test Dataset", objects=["obj001", "obj002"])
    print(dataset.to_dict())
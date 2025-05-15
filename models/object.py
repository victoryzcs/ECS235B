from typing import Dict, Any
from .base_model import BaseModel

class Object(BaseModel):
    def __init__(self, id: str, name: str, dataset: str, conflict_class: str = None):
        self.id = id # Used as _id
        self.name = name
        self.dataset = dataset
        self.conflict_class = conflict_class

    def to_dict(self) -> Dict[str, Any]:
        return {
            '_id': self.id,
            'name': self.name,
            'dataset': self.dataset,
            'conflict_class': self.conflict_class
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Object':
        if not data:
            return None
        return cls(
            id=data['_id'],
            name=data.get('name'),
            dataset=data.get('dataset'),
            conflict_class=data.get('conflict_class')
        )

if __name__ == "__main__":

    obj = Object(id="1", name="test", dataset="test", conflict_class="test")
    print(obj.to_dict())
    print(obj.from_dict(obj.to_dict()))
    print(type(obj.from_dict(obj.to_dict())))
from pydantic import BaseModel
from typing import Dict
class Object(BaseModel):
    id: str
    name: str
    dataset: str
    conflict_class: str

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "dataset": self.dataset,
            "conflict_class": self.conflict_class
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Object':
        return cls(
            id=data.get("id"),
            name=data.get("name"),
            dataset=data.get("dataset"),
            conflict_class=data.get("conflict_class")
        )

if __name__ == "__main__":

    obj = Object(id="1", name="test", dataset="test", conflict_class="test")
    print(obj.to_dict())
    print(obj.from_dict(obj.to_dict()))
    print(type(obj.from_dict(obj.to_dict())))
from pydantic import BaseModel, Field
from typing import List

class User(BaseModel):
    id: str
    name: str
    roles: List[str] = Field(default_factory=list)
    access_history: List[str] = Field(default_factory=list)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "roles": self.roles,
            "access_history": self.access_history
        }
    
    @classmethod
    def from_dict(cls, data):
        """
        Create a User object from a dictionary
        """
        return cls(
            id = data.get("id"),
            name = data.get("name"),
            roles = data.get("roles", []),
            access_history = data.get("access_history",[])
        )



if __name__ == "__main__":
    user = User(
        id = "1",
        name = "John Doe",
        roles = ["admin", "user"],
        access_history = ["APPLE", "NVIDIA", "TESLA"]
    )

    user2 = User(
        id = "2",
        name = "Jane Doe",
        roles = ["user"],
        access_history = ["APPLE", "NVIDIA", "TESLA"]
    )
    print(type(user.from_dict(user.to_dict())))
    print(user.from_dict(user.to_dict()))
    # check all users 
    print(User)
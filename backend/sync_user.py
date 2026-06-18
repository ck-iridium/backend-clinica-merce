from app.database import SessionLocal
from app.models import User, Profile
import sys

def sync_user():
    db = SessionLocal()
    user_id = '24e43093-af0f-43f6-abff-3b7f3fd08fc7'
    email = 'iridium_cop@hotmail.com'
    
    # Check User
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(id=user_id, email=email, role='admin', hashed_password='[EXTERNAL]')
        db.add(user)
        print(f"User created: {email}")
    else:
        user.role = 'admin'
        user.id = user_id # Ensure ID matches Auth ID
        print(f"User updated: {email}")
        
    # Check Profile
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        profile = Profile(
            id=user_id, 
            full_name='Tono', 
            email=email, 
            role='admin', 
            status='active'
        )
        db.add(profile)
        print(f"Profile created for: Tono")
    else:
        profile.role = 'admin'
        profile.full_name = 'Tono'
        print(f"Profile updated for: Tono")
        
    db.commit()
    db.close()
    print("Sync complete!")

if __name__ == "__main__":
    sync_user()

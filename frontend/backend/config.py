import os

class Config:
       SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
       SQLALCHEMY_DATABASE_URI = 'postgresql://username:password@localhost/shop_db'  # Update with your credentials
       SQLALCHEMY_TRACK_MODIFICATIONS = False
       JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwtsecretkey')

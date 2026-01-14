from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'  # Name of the table

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(15))
    password_hash = db.Column(db.String(128), nullable=False)

    # Relationship to Order
    orders = db.relationship('Order', backref='user', lazy=True)

    def __repr__(self):
        return f'<User  {self.username}>'

class Product(db.Model):
    __tablename__ = 'products'  # Name of the table

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    image_url = db.Column(db.String(255))

    def __repr__(self):
        return f'<Product {self.name}>'

class Order(db.Model):
    __tablename__ = 'orders'  # Name of the table

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    products = db.Column(db.Text, nullable=False)  # JSON string of products
    total_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Timestamp for order creation
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # Timestamp for updates

    def __repr__(self):
        return f'<Order {self.id} by User {self.user_id}>'

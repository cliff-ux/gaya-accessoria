from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate  # Import Flask-Migrate


# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()  # Initialize Migrate instance

def create_app():
    app = Flask(__name__)
    
    # Database connection string
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:muhangani001@localhost/shop_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Optional: to suppress a warning

    CORS(app)  # Enable CORS to allow frontend requests

    # Initialize extensions with the app
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)  # Bind Flask-Migrate to app and db


    # Define your database models here
    class User(db.Model):
        __tablename__ = 'users'  # Name of the table

        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(100), unique=True, nullable=False)  # Added username field
        email = db.Column(db.String(120), unique=True, nullable=False)
        phone = db.Column(db.String(15))  # Added phone field
        password_hash = db.Column(db.String(128), nullable=False)  # Added password_hash field

    class Product(db.Model):
        __tablename__ = 'products'  # Name of the table

        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(100), nullable=False)
        price = db.Column(db.Float, nullable=False)
        description = db.Column(db.String(255))
        image_url = db.Column(db.String(255))

    class Order(db.Model):
        __tablename__ = 'orders'  # Name of the table

        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        products = db.Column(db.Text, nullable=False)  # JSON string of products
        total_amount = db.Column(db.Float, nullable=False)

    with app.app_context():
        db.create_all() 
             # Create database tables


    # Import routes using the full package path
    from frontend.backend.routes import api_bp  # Adjusted import to use full package path
    app.register_blueprint(api_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
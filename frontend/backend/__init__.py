from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
       app = Flask(__name__)
       app.config.from_object('config')  # Adjust this if your config is in a different file
       
       db.init_app(app)
       bcrypt.init_app(app)

       with app.app_context():
           from . import routes  # Import routes here

       return app
   
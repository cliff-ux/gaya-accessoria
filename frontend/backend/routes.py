from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from frontend.backend.app import db, bcrypt
from frontend.backend.models import User, Product, Order
import json

api_bp = Blueprint('api', __name__)

# 1. User Registration
@api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify(message="Missing required fields"), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify(message="User already exists"), 409

    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, phone=phone, password_hash=pw_hash)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User registered successfully"), 201

# 2. User Login
@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username_or_email = data.get('username')
    password = data.get('password')

    if not username_or_email or not password:
        return jsonify(message="Missing username or password"), 400

    user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify(message="Invalid credentials"), 401

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token, username=user.username), 200

# 3. Fetch Products
@api_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    result = []
    for p in products:
        result.append({
            'id': p.id,
            'name': p.name,
            'price': p.price,
            'description': p.description,
            'image_url': p.image_url
        })
    return jsonify(products=result), 200

# 4. Create Order (Requires Authentication)
@api_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    products = data.get('products')  # Expects list of {id, quantity}
    total_amount = data.get('total_amount')

    if not products or total_amount is None:
        return jsonify(message="Products and total amount are required"), 400

    order = Order(user_id=current_user_id, products=json.dumps(products), total_amount=total_amount)
    db.session.add(order)
    db.session.commit()

    return jsonify(message="Order created successfully", order_id=order.id), 201




# Additional routes can be added below as needed


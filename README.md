# 🍔 Foodie — Full Stack Food Delivery Application

A full-stack food ordering application developed using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.

Foodie allows users to explore restaurants, browse menus, manage their shopping carts, place orders, and view order history through a responsive interface.

The project demonstrates full-stack development, RESTful API integration, JWT authentication, database management, and payment gateway integration.

## 🚀 Features

### User Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected backend routes
- User logout functionality

### Restaurant Discovery
- Browse restaurant listings
- Search restaurants by name and cuisine
- Filter top-rated restaurants
- View restaurant menus
- Expandable menu categories
- Loading placeholders using shimmer UI

### Shopping Cart
- Add food items to the cart
- Increase or decrease item quantities
- Remove individual items
- Clear the entire cart
- Cart state management using Redux Toolkit

### Checkout and Orders
- Delivery address collection
- Order placement
- Cash on Delivery (COD)
- Razorpay payment gateway integration
- Order history
- Individual order details

**Payment note:** Razorpay integration is included in the project. Complete payment-flow testing should be verified before production use.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit, React Redux |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Payments | Razorpay |
| API Testing | Postman |
| Frontend Testing | Jest, React Testing Library |
| Development Tools | Git, GitHub, VS Code |

## 📂 Project Structure

```text
Foodie-FullStack/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── app.js
│   ├── package.json
│   └── index.html
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🏗️ Application Architecture

```text
                  USER
                    |
                    v
             React Frontend
                    |
                    v
              Redux Toolkit
                    |
                    v
              REST API Calls
                    |
                    v
             Express.js Server
                    |
          +---------+---------+
          |         |         |
          v         v         v
     Auth APIs   Menu APIs  Order APIs
          |         |         |
          +---------+---------+
                    |
                    v
                 MongoDB

       Payment Integration: Razorpay
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or local MongoDB installation
- Git
- Razorpay test credentials for payment testing

### 1. Clone the Repository

```bash
git clone https://github.com/manas7556/Foodie-FullStack.git
cd Foodie-FullStack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory.

Configure the environment variables required by the backend, including database connectivity, JWT authentication, CORS settings, and payment integration.

Never commit real credentials or secrets to GitHub.

Start the backend:

```bash
npm run dev
```

The backend is configured to run locally on port `8000`.

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm start
```

The frontend uses Parcel and typically runs on port `1234`.

Ensure the frontend API configuration points to the running backend.

## 🔐 Authentication Flow

1. A user registers with their details.
2. The backend validates the request.
3. The password is hashed using bcrypt.
4. User information is stored in MongoDB.
5. During login, the backend verifies the credentials.
6. JWT tokens are generated after successful authentication.
7. Protected routes validate the access token before processing requests.

## 📡 REST API Overview

The backend organizes endpoints into the following groups:

| Module | Purpose |
|---|---|
| Users | Registration, login, logout |
| Restaurants | Restaurant information |
| Menu | Restaurant menu information |
| Orders | Order creation and retrieval |
| Payments | Payment order creation and verification |

The API route definitions are available in `backend/src/routes/`.

## 🧪 Testing

Frontend component tests are written using Jest and React Testing Library.

Test files cover components and functionality including:

- Header
- Contact
- Restaurant search
- Utility functions

Run the tests using the test command configured in the frontend's `package.json`.

## 📸 Application Screenshots

Screenshots will be added for:

- Home page and restaurant listings
- Restaurant menu
- Shopping cart
- Login and registration
- Checkout
- Order history

## 🔮 Future Improvements

- Restaurant administration dashboard
- Advanced restaurant filtering
- Real-time order tracking
- Improved responsive layouts
- Automated API and integration tests
- Production deployment
- Enhanced payment error handling

## 👨‍💻 Developer

**Manas Kumar Behera**

MCA — Artificial Intelligence & Machine Learning  
Chandigarh University

Bengaluru, Karnataka, India

**GitHub:** manas7556

## 📌 Project Status

**Development project — core MERN functionality implemented.**

Additional integration testing, documentation, security review, and deployment preparation are ongoing.

# 🔐 MESOB Bot Admin Access Guide

## 📋 Available Admin Accounts

### 🏛️ **Super Admin**
- **Email**: `admin@mesob.gov.et`
- **Password**: `admin123`
- **Role**: Super Admin
- **Access**: Full system control

### 🎖️ **Director**
- **Email**: `director@mesob.gov.et` 
- **Password**: `director2024`
- **Role**: MESOB Director
- **Access**: Executive oversight

### 📊 **Operations Manager**
- **Email**: `manager@mesob.gov.et`
- **Password**: `manager2024`
- **Role**: Operations Manager
- **Access**: Daily operations management

### 👮 **Application Supervisor**
- **Email**: `supervisor@mesob.gov.et`
- **Password**: `super2024`
- **Role**: Application Supervisor
- **Access**: Application processing oversight

### 🛂 **Passport Services Coordinator**
- **Email**: `passport@mesob.gov.et`
- **Password**: `passport2024`
- **Role**: Service Coordinator
- **Access**: Passport service management

### 🏢 **Business Services Coordinator**
- **Email**: `business@mesob.gov.et`
- **Password**: `business2024`
- **Role**: Service Coordinator
- **Access**: Business licensing management

## 🚀 How to Access Admin Dashboard

### Method 1: Direct Command
1. Send `/admin` command to the bot
2. If not logged in, you'll get login instructions
3. If already logged in, dashboard will open directly

### Method 2: Login Format
Send your credentials in this format:
```
email:password
```

**Examples:**
- `admin@mesob.gov.et:admin123`
- `director@mesob.gov.et:director2024`
- `manager@mesob.gov.et:manager2024`

### Method 3: List All Admins
- Send `/admins` command (only works if you're already logged in)
- Shows all available admin accounts with roles

## 🔧 Admin Dashboard Features

### 📊 **View Applications**
- Recent applications
- Filter by status (pending, approved, rejected)
- Search applications by tracking number or user details

### 👥 **User Management**
- View all registered users
- User statistics and analytics

### 📈 **Statistics Dashboard**
- Total users and applications
- Service breakdown analytics
- Status distribution charts

### 🔍 **Search & Filter**
- Advanced application search
- Filter by service type, status, date range

### 📢 **Broadcast Messages**
- Send messages to all users
- System announcements and updates

### ⚙️ **Application Management**
- Approve/reject applications
- Add notes and comments
- Update application status

## 🎯 Available Admin Commands

- `/admin` - Access admin dashboard
- `/admins` - List all administrators (admin only)
- `/help` - Shows additional admin commands when logged in
- `/menu` - Return to main menu
- `/cancel` - Cancel current admin operation

## 🔒 Security Notes

⚠️ **Important Security Information:**
1. **Change default passwords** in production environment
2. Admin credentials are currently stored in code - migrate to secure database
3. Enable 2FA for production deployment
4. Regular password rotation recommended
5. Monitor admin access logs

## 🚨 Emergency Access

If you lose admin access:
1. Check the `src/services/adminService.js` file
2. Admin accounts are defined in the constructor
3. You can modify credentials directly in the code
4. Restart the bot after making changes

## 📞 Technical Support

For technical issues with admin access:
- **Phone**: +251 913 116898
- **Email**: admin@mesob.gov.et
- **Website**: mesobshashe.gov.et

---

**⚡ Quick Start for Admins:**
1. Send `/admin` to @MESOB_SHASHE_bot
2. Use format: `admin@mesob.gov.et:admin123`
3. Access full dashboard immediately!
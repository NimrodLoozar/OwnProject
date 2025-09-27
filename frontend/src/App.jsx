import { Layout, Menu, Button, Drawer } from "antd";
import {
  HomeOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import SettingsPage from "./pages/SettingsPage";
import Dashboard from "./pages/Dashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import DeletedUserPage from "./pages/DeletedUserPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.scss";

const { Header, Sider, Content, Footer } = Layout;

// Component that uses auth context (must be inside AuthProvider)
const AppContent = () => {
  const { isAuthenticated, user, logout, userDeleted, isOwner } = useAuth();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Redirect to deleted user page if user was deleted
  useEffect(() => {
    if (userDeleted) {
      window.location.href = "/deleted";
    }
  }, [userDeleted]);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">About</Link>,
    },
    {
      key: "3",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
    // Add admin menu item for owners only
    ...(isOwner()
      ? [
          {
            key: "4",
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Manage Users</Link>,
          },
        ]
      : []),
  ];

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Desktop Sidebar */}
      {isAuthenticated && !isMobile && (
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div className="sider-logo">MyApp</div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems}
          />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isAuthenticated && isMobile && (
        <Drawer
          title="MyApp"
          placement="left"
          onClose={closeMobileMenu}
          open={mobileMenuVisible}
          bodyStyle={{ padding: 0, backgroundColor: "#001529" }}
          headerStyle={{
            background: "#001529",
            color: "white",
            borderBottom: "1px solid #303030",
          }}
          width={250}
        >
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems}
            onClick={closeMobileMenu}
            style={{ border: "none", backgroundColor: "#001529" }}
          />
        </Drawer>
      )}

      <Layout
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: isAuthenticated && !isMobile ? 200 : 0,
          marginTop: "5rem",
        }}
      >
        {/* Header with mobile menu button */}
        {isAuthenticated && (
          <Header className="site-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isMobile && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setMobileMenuVisible(true)}
                  style={{
                    color: "white",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                  }}
                />
              )}
              <h1 style={{ color: "white", margin: 0 }}>Welcome to MyApp</h1>
            </div>

            <div
              className="user-section"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <span style={{ color: "white" }}>
                Hello, {user?.username} {user?.role === "owner" && "(Owner)"}
              </span>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </Header>
        )}

        <Content
          className={isAuthenticated ? "site-content" : ""}
          style={{ flex: 1 }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/deleted" element={<DeletedUserPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Content>

        {/* Only show footer when authenticated */}
        {isAuthenticated && (
          <Footer style={{ textAlign: "center" }}>
            ©2025 Created with Ant Design
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

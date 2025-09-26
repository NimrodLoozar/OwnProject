import React, { useState } from "react";
import { Card, Form, Input, Button, Alert, Space, Tabs } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { TabPane } = Tabs;

const Login = () => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { login, register } = useAuth();

  const handleLogin = async (values) => {
    const { username, password } = values;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await login(username, password);
      // Login successful - the context will handle the state update
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    const { username, email, password } = values;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register(username, email, password);
      setSuccess("Registration successful! You can now login.");
      registerForm.resetFields();
      setActiveTab("login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setError("");
    setSuccess("");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <Card
        title={
          <div style={{ textAlign: "center" }}>
            <h2 className="responsive-text" style={{ margin: 0 }}>
              Welcome to MyApp
            </h2>
            <p
              className="responsive-text"
              style={{ margin: "8px 0 0 0", color: "#666" }}
            >
              Please sign in or create an account to continue
            </p>
          </div>
        }
        className="responsive-card"
        style={{
          maxWidth: "min(420px, 90vw)",
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          <TabPane tab="Login" key="login">
            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  {
                    required: true,
                    message: "Please enter your username!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your username"
                  style={{ fontSize: "16px" }} // Prevents zoom on iOS
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your password!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  style={{ fontSize: "16px" }} // Prevents zoom on iOS
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading && activeTab === "login"}
                  className="responsive-button"
                  style={{
                    width: "100%",
                    height: "40px",
                    fontSize: "16px",
                  }}
                >
                  {loading && activeTab === "login"
                    ? "Signing in..."
                    : "Sign In"}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Register" key="register">
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  {
                    required: true,
                    message: "Please enter a username!",
                  },
                  {
                    min: 3,
                    message: "Username must be at least 3 characters long!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Choose a username"
                  style={{ fontSize: "16px" }} // Prevents zoom on iOS
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email!",
                  },
                  {
                    type: "email",
                    message: "Please enter a valid email!",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email"
                  style={{ fontSize: "16px" }} // Prevents zoom on iOS
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: true,
                    message: "Please enter a password!",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters long!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Choose a password"
                  style={{ fontSize: "16px" }} // Prevents zoom on iOS
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm your password"
                  style={{ fontSize: "16px" }} // Prevents zoom on iOS
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading && activeTab === "register"}
                  className="responsive-button"
                  style={{
                    width: "100%",
                    height: "40px",
                    fontSize: "16px",
                  }}
                >
                  {loading && activeTab === "register"
                    ? "Creating Account..."
                    : "Create Account"}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {success && (
          <Alert
            message={success}
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Login;

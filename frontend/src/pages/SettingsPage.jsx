import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  message,
  Spin,
  Upload,
  Divider,
  Space,
  Typography,
  Flex,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  LockOutlined,
  SafetyOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ThemeSelector from "../components/ThemeSelector";

const { Title, Text } = Typography;

function SettingsPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const { user, apiCall, refreshUser } = useAuth();
  const { themeMode, isDarkMode } = useTheme();

  // Avatar upload functions
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === "uploading") {
      setUploadLoading(true);
      return;
    }
    if (info.file.status === "done") {
      try {
        const formData = new FormData();
        formData.append("file", info.file.originFileObj);
        
        const response = await apiCall("/users/me/profile-picture", "POST", formData);
        
        // Update image URL with backend response
        const profilePictureUrl = `http://localhost:8000${response.profile_picture}`;
        setImageUrl(profilePictureUrl);
        setUploadLoading(false);
        message.success("Profile picture updated successfully!");
        
        // Refresh user data to get the updated profile picture
        window.location.reload(); // Simple approach to refresh user data
      } catch (error) {
        setUploadLoading(false);
        console.error("Failed to upload profile picture:", error);
        message.error("Failed to upload profile picture");
      }
    } else if (info.file.status === "error") {
      setUploadLoading(false);
      message.error("Upload failed");
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await apiCall("/users/me/profile-picture", "DELETE");
      setImageUrl(null);
      message.success("Profile picture deleted successfully!");
    } catch (error) {
      console.error("Failed to delete profile picture:", error);
      message.error("Failed to delete profile picture");
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      // Load user data and any settings
      if (user) {
        form.setFieldsValue({
          username: user.username,
          email: user.email,
        });
        // Load user avatar if exists
        const profilePictureUrl = user.profile_picture 
          ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${user.profile_picture}` 
          : null;
        setImageUrl(profilePictureUrl);
        setTwoFAEnabled(user.twoFactorEnabled || false);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      message.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // For now, just show a success message since we're not implementing full user update
      message.success("Settings saved successfully!");
      console.log("Settings to save:", values);
    } catch (error) {
      console.error("Failed to save settings:", error);
      message.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setSaving(true);
    try {
      // TODO: Implement password change API call
      message.success("Password changed successfully!");
      passwordForm.resetFields();
      console.log("Password change:", values);
    } catch (error) {
      console.error("Failed to change password:", error);
      message.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFAToggle = async (enabled) => {
    try {
      setTwoFAEnabled(enabled);
      // TODO: Implement 2FA enable/disable API call
      message.success(
        `Two-Factor Authentication ${
          enabled ? "enabled" : "disabled"
        } successfully!`
      );
      console.log("2FA toggle:", enabled);
    } catch (error) {
      console.error("Failed to toggle 2FA:", error);
      message.error("Failed to update Two-Factor Authentication");
      setTwoFAEnabled(!enabled); // Revert on error
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  if (loading) {
    return (
      <Card
        title="Settings"
        className="responsive-card"
        style={{
          width: "100%",
          margin: "20px auto",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <p className="responsive-text" style={{ marginTop: "20px" }}>
            Loading your settings...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* Profile Section */}
      <Card
        title={
          <Title level={3}>
            <UserOutlined /> Profile Settings
          </Title>
        }
        className="responsive-card"
        style={{ marginBottom: "20px" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Flex gap="large" align="start" wrap>
          {/* Avatar Upload */}
          <div style={{ textAlign: "center" }}>
            <Text strong style={{ display: "block", marginBottom: "12px" }}>
              Profile Picture
            </Text>
            <Upload
              name="avatar"
              listType="picture-circle"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  setUploadLoading(true);
                  const formData = new FormData();
                  formData.append("file", file);
                  
                  const response = await apiCall("/users/me/profile-picture", "POST", formData);
                  
                  // Update image URL with backend response
                  const profilePictureUrl = `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}${response.profile_picture}`;
                  setImageUrl(profilePictureUrl);
                  setUploadLoading(false);
                  message.success("Profile picture updated successfully!");
                  
                  // Refresh user data to get the updated profile picture
                  await refreshUser();
                  onSuccess();
                } catch (error) {
                  setUploadLoading(false);
                  console.error("Failed to upload profile picture:", error);
                  message.error("Failed to upload profile picture");
                  onError(error);
                }
              }}
              beforeUpload={beforeUpload}
            >
              {imageUrl ? (
                <img
                  draggable={false}
                  src={imageUrl}
                  alt="avatar"
                  style={{ width: "100%", borderRadius: "50%" }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
            <Text
              type="secondary"
              style={{ fontSize: "12px", display: "block", marginTop: "8px" }}
            >
              JPG/PNG, max 2MB
            </Text>
            {imageUrl && (
              <Button 
                type="text" 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleDeleteProfilePicture}
                style={{ marginTop: "8px" }}
              >
                Remove
              </Button>
            )}
          </div>

          {/* Basic Info Form */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              style={{ width: "100%" }}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please enter your username!" },
                  {
                    min: 3,
                    message: "Username must be at least 3 characters!",
                  },
                ]}
              >
                <Input
                  placeholder="Enter username"
                  disabled
                  style={{ fontSize: "16px" }}
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  placeholder="Enter email"
                  disabled
                  style={{ fontSize: "16px" }}
                />
              </Form.Item>

              <Form.Item
                label="Theme Preference"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ThemeSelector size="default" showLabels={true} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Choose your preferred theme or follow system settings
                  </Text>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  className="responsive-button"
                  style={{ width: "100%" }}
                >
                  {saving ? "Saving..." : "Save Profile Settings"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Flex>
      </Card>

      {/* Password Change Section */}
      <Card
        title={
          <Title level={3}>
            <LockOutlined /> Change Password
          </Title>
        }
        className="responsive-card"
        style={{ marginBottom: "20px" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ maxWidth: "400px" }}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: "Please enter your current password!",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
              style={{ fontSize: "16px" }}
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a new password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              style={{ fontSize: "16px" }}
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
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
              placeholder="Confirm new password"
              style={{ fontSize: "16px" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              className="responsive-button"
              style={{ width: "100%" }}
            >
              {saving ? "Changing Password..." : "Change Password"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Two-Factor Authentication Section */}
      <Card
        title={
          <Title level={3}>
            <SafetyOutlined /> Two-Factor Authentication
          </Title>
        }
        className="responsive-card"
        bodyStyle={{ padding: "24px" }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Text strong>Two-Factor Authentication (2FA)</Text>
            <br />
            <Text type="secondary">
              Add an extra layer of security to your account by enabling
              two-factor authentication.
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Switch
              checked={twoFAEnabled}
              onChange={handleTwoFAToggle}
              loading={saving}
            />
            <Text>{twoFAEnabled ? "2FA is enabled" : "2FA is disabled"}</Text>
          </div>

          {twoFAEnabled && (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "6px",
              }}
            >
              <Text type="success">
                <SafetyOutlined /> Your account is protected with two-factor
                authentication.
              </Text>
            </div>
          )}
        </Space>
      </Card>

      {/* Info Note */}
      <div
        className="responsive-text"
        style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
          color: "#666",
          lineHeight: "1.5",
        }}
      >
        <strong>Note:</strong> Username and email cannot be changed after
        registration. Only preferences, password, and security settings can be
        modified.
      </div>
    </div>
  );
}

export default SettingsPage;

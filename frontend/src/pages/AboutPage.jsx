import { Card, Descriptions } from "antd";

function AboutPage() {
  return (
    <Card
      title="About"
      className="responsive-card"
      style={{
        width: "100%",
        margin: "20px auto",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
        className="responsive-text"
      >
        <Descriptions.Item label="App">MyApp</Descriptions.Item>
        <Descriptions.Item label="Version">1.0.0</Descriptions.Item>
        <Descriptions.Item label="Made With">
          React + Ant Design + FastAPI
        </Descriptions.Item>
        <Descriptions.Item label="Features">
          User Authentication, Data Persistence, QR Code Generation
        </Descriptions.Item>
      </Descriptions>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#f0f9ff",
          borderRadius: "6px",
          borderLeft: "4px solid #1890ff",
        }}
      >
        <p className="responsive-text" style={{ margin: 0, color: "#333" }}>
          <strong>Welcome to MyApp!</strong> This is a full-stack application
          with secure authentication, real-time data saving, and QR code
          generation functionality.
        </p>
      </div>
    </Card>
  );
}

export default AboutPage;

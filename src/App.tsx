import { WebSocketProvider } from './context/WebSocketContext'
import { PixelArtCanvas } from './components/PixelArtCanvas'
import { ConfigProvider, theme, Layout, Typography, Space } from 'antd'
import './App.css'

const { Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#0d1117',
          colorBgContainer: '#161b22',
          colorBorder: '#30363d',
          colorText: '#e6edf3',
          colorTextSecondary: '#8b949e',
        }
      }}
    >
      <WebSocketProvider url={import.meta.env.VITE_WS_URL}>
        <Layout style={{ 
          minHeight: '100vh', 
          padding: '20px',
          background: '#0d1117'
        }}>
          <Content>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Title level={1} style={{ 
                textAlign: 'center',
                color: '#e6edf3',
                marginBottom: '40px'
              }}>
                pxl
              </Title>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PixelArtCanvas />
              </div>
            </Space>
          </Content>
        </Layout>
      </WebSocketProvider>
    </ConfigProvider>
  )
}

export default App

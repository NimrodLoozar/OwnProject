import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';

const ThemeSelector = ({ size = 'default', showLabels = false, direction = 'horizontal' }) => {
  const { themeMode, loading, setTheme } = useTheme();

  const themeOptions = [
    {
      key: THEME_MODES.LIGHT,
      icon: <SunOutlined />,
      label: 'Light',
      tooltip: 'Light theme'
    },
    {
      key: THEME_MODES.DARK,
      icon: <MoonOutlined />,
      label: 'Dark',
      tooltip: 'Dark theme'
    },
    {
      key: THEME_MODES.SYSTEM,
      icon: <DesktopOutlined />,
      label: 'System',
      tooltip: 'Follow system theme'
    }
  ];

  const handleThemeChange = (newTheme) => {
    if (newTheme !== themeMode && !loading) {
      setTheme(newTheme);
    }
  };

  return (
    <Space direction={direction} size="small">
      {themeOptions.map((option) => {
        const isActive = themeMode === option.key;
        
        const button = (
          <Button
            key={option.key}
            type={isActive ? 'primary' : 'default'}
            icon={option.icon}
            size={size}
            loading={loading && isActive}
            onClick={() => handleThemeChange(option.key)}
            style={{
              minWidth: showLabels ? '90px' : '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: showLabels ? '8px' : '0',
              transition: 'all 0.2s ease',
              ...(isActive && {
                boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
              }),
            }}
          >
            {showLabels && option.label}
          </Button>
        );

        return showLabels ? (
          button
        ) : (
          <Tooltip key={option.key} title={option.tooltip} placement="top">
            {button}
          </Tooltip>
        );
      })}
    </Space>
  );
};

export default ThemeSelector;

import Footer from '@/components/Footer';
import { authService } from '@/services/auth/authService';
import type { LoginCredentials, RegisterData } from '@/services/auth/types';
import rules from '@/utils/rules';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Radio, Tabs, message } from 'antd';
import React, { useState } from 'react';
import { history, useModel } from 'umi';
import styles from './index.less';

const Login: React.FC = () => {
	const [submitting, setSubmitting] = useState(false);
	const [type, setType] = useState<string>('login');
	const { setInitialState } = useModel('@@initialState');
	const [loginForm] = Form.useForm();
	const [registerForm] = Form.useForm();	const handleLogin = async (values: LoginCredentials) => {
		setSubmitting(true);
		try {
			const response = await authService.login(values);
			
			if (response.success && response.user) {
				// state => user
				setInitialState({
					currentUser: response.user,
					permissionLoading: false,
				});
				
				message.success(response.message);
				
				// url truoc login
				const urlParams = new URLSearchParams(window.location.search);
				const redirect = urlParams.get('redirect') || '/dashboard';
				history.push(redirect);
			} else {
				message.error(response.message);
			}
		} catch (error) {
			console.error('Login error:', error);
			message.error('Có lỗi xảy ra khi đăng nhập');
		} finally {
			setSubmitting(false);
		}
	};

	const handleRegister = async (values: RegisterData) => {
		setSubmitting(true);
		try {
			const response = await authService.register(values);
			
			if (response.success) {
				message.success(response.message);
				registerForm.resetFields();
				setType('login'); // toi login
			} else {
				message.error(response.message);
			}
		} catch (error) {
			message.error('Có lỗi xảy ra khi đăng ký');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.top}>
					<div className={styles.header}>
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
							<img alt='logo' className={styles.logo} src='/logo-full.svg' />
							<div style={{ textAlign: 'center', marginTop: 16 }}>
								<h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff', margin: 0 }}>
									Diễn đàn Hỏi Đáp Sinh viên
								</h1>
								<p style={{ color: '#666', fontSize: 16, margin: '8px 0 0 0' }}>
									Nền tảng chia sẻ kiến thức học thuật
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className={styles.main}>
					<Card style={{ maxWidth: 450, margin: '0 auto', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
						<Tabs activeKey={type} onChange={setType} centered size="large">
							<Tabs.TabPane key='login' tab='Đăng nhập' />
							<Tabs.TabPane key='register' tab='Đăng ký' />
						</Tabs>

						{type === 'login' ? (							<Form
								form={loginForm}
								onFinish={handleLogin}
								layout='vertical'
								size='large'
							>
								<Form.Item 
									name='email' 
									rules={[...rules.required, ...rules.email]}
									label="Email"
								>
									<Input
										placeholder='Nhập địa chỉ email'
										prefix={<MailOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>
								
								<Form.Item 
									name='password' 
									rules={[...rules.required]}
									label="Mật khẩu"
								>
									<Input.Password
										placeholder='Nhập mật khẩu'
										prefix={<LockOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>

								<Form.Item>
									<Button 
										type='primary' 
										htmlType='submit' 
										loading={submitting}
										block
										size="large"
										style={{ height: 45 }}
									>
										Đăng nhập
									</Button>
								</Form.Item>								<div style={{ textAlign: 'center', marginTop: 16 }}>
									<small style={{ color: '#666' }}>
										<strong>Test:</strong> admin@university.edu, teacher@university.edu, student@university.edu<br/>
										<span style={{ color: '#999' }}>Password: admin123, teacher123, student123</span>
									</small>
								</div>
							</Form>
						) : (
							<Form
								form={registerForm}
								onFinish={handleRegister}
								layout='vertical'
								size='large'
							>
								<Form.Item 
									name='fullName' 
									rules={[...rules.required, ...rules.ten]}
									label="Họ và tên"
								>
									<Input
										placeholder='Nhập họ và tên'
										prefix={<UserOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>

								<Form.Item 
									name='username' 
									rules={[...rules.required, ...rules.forumUsername]}
									label="Tên đăng nhập"
								>
									<Input
										placeholder='Nhập tên đăng nhập'
										prefix={<UserOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>
								
								<Form.Item 
									name='email' 
									rules={[...rules.required, ...rules.email]}
									label="Email"
								>
									<Input
										placeholder='Nhập email'
										prefix={<MailOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>
								
								<Form.Item 
									name='password' 
									rules={[...rules.required, ...rules.forumPassword]}
									label="Mật khẩu"
								>
									<Input.Password
										placeholder='Nhập mật khẩu'
										prefix={<LockOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>

								<Form.Item 
									name='confirmPassword' 
									dependencies={['password']}
									rules={[
										...rules.required,
										({ getFieldValue }) => ({
											validator(_, value) {
												if (!value || getFieldValue('password') === value) {
													return Promise.resolve();
												}
												return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
											},
										}),
									]}
									label="Xác nhận mật khẩu"
								>
									<Input.Password
										placeholder='Nhập lại mật khẩu'
										prefix={<LockOutlined style={{ color: '#1890ff' }} />}
									/>
								</Form.Item>

								<Form.Item 
									name='role' 
									rules={[...rules.required]}
									initialValue='student'
									label="Vai trò"
								>
									<Radio.Group>
										<Radio value='student'>Sinh viên</Radio>
										<Radio value='teacher'>Giảng viên</Radio>
									</Radio.Group>
								</Form.Item>

								<Form.Item>
									<Button 
										type='primary' 
										htmlType='submit' 
										loading={submitting}
										block
										size="large"
										style={{ height: 45 }}
									>
										Đăng ký
									</Button>
								</Form.Item>
							</Form>
						)}
					</Card>
				</div>
			</div>

			<div className='login-footer'>
				<Footer />
			</div>
		</div>
	);
};

export default Login;

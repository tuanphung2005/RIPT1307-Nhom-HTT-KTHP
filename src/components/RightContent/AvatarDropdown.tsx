import { landingUrl } from '@/services/base/constant';
import { FileWordOutlined, GlobalOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import { type ItemType } from 'antd/lib/menu/hooks/useItems';
import React from 'react';
import { useModel } from 'umi';
import { useAuthActions } from '@/hooks/useAuthActions';
import HeaderDropdown from './HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
	menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
	const { initialState } = useModel('@@initialState');
	const { handleLogout } = useAuthActions();

	const loginOut = () => handleLogout();
	if (!initialState || !initialState.currentUser)
		return (
			<span className={`${styles.action} ${styles.account}`}>
				<Spin size='small' style={{ marginLeft: 8, marginRight: 8 }} />
			</span>
		);
	// use full name + suggestion fullname+@username
	const fullName = initialState.currentUser?.fullName || initialState.currentUser?.username || '';
	const userRole = initialState.currentUser?.role || '';
	
	// display  + role
	const getRoleDisplayName = (role: string) => {
		switch (role) {
			case 'admin':
				return 'Quản trị viên';
			case 'teacher':
				return 'Giảng viên';
			case 'student':
				return 'Sinh viên';
			default:
				return role;
		}
	};
	
	const displayName = `${fullName} (${getRoleDisplayName(userRole)})`;
	const lastNameChar = fullName.split(' ')?.at(-1)?.[0]?.toUpperCase();
	const items: ItemType[] = [
		{
			key: 'name',
			icon: <UserOutlined />,
			label: displayName,
		},
		// {
		// 	key: 'password',
		// 	icon: <SwapOutlined />,
		// 	label: 'Đổi mật khẩu',
		// 	onClick: () => {
		// 		const redirect = window.location.href;
		// 		window.location.href = `${keycloakAuthEndpoint}?client_id=${AppModules[currentRole].clientId}&redirect_uri=${redirect}&response_type=code&scope=openid&kc_action=UPDATE_PASSWORD`;
		// 	},
		// },
		{
			key: 'office',
			icon: <FileWordOutlined />,
			label: 'Office 365',
			onClick: () => window.open('https://office.com/'),
		},
		{
			key: 'portal',
			icon: <GlobalOutlined />,
			label: APP_CONFIG_TITLE_LANDING ?? 'Cổng thông tin',
			onClick: () => window.open(landingUrl),
		},
		{ type: 'divider', key: 'divider' },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Đăng xuất',
			onClick: loginOut,
			danger: true,
		},	];

	if (menu && initialState.currentUser.role !== 'admin') {
		// items.splice(1, 0, {
		//   key: 'center',
		//   icon: <UserOutlined />,
		//   label: 'Trang cá nhân',
		//   onClick: () => history.push('/account/center'),
		// });
	}
	return (
		<>
			<HeaderDropdown overlay={<Menu className={styles.menu} items={items} />}>
				<span className={`${styles.action} ${styles.account}`}>
					<Avatar
						className={styles.avatar}
						src={initialState.currentUser?.avatar}
						icon={!initialState.currentUser?.avatar ? lastNameChar ?? <UserOutlined /> : undefined}
						alt='avatar'
					/>
					<span className={`${styles.name}`}>{displayName}</span>
				</span>
			</HeaderDropdown>
		</>
	);
};

export default AvatarDropdown;

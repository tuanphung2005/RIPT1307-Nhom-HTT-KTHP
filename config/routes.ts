﻿export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',	},

	// ADMIN ROUTES
	{
		path: '/admin',
		name: 'Quản trị',
		icon: 'SettingOutlined',
		access: 'canAdmin',
		routes: [
			{
				path: '/admin/posts',
				name: 'Quản lý bài đăng',
				component: './Admin/PostManagement',
			},
			{
				path: '/admin/users',
				name: 'Quản lý người dùng',
				component: './Admin/UserManagement',
			},
			{
				redirect: '/admin/posts',
			},
		],
	},

	// FORUM ROUTES
	{
		path: '/forum',
		name: 'Diễn đàn',
		component: './Forum',
		icon: 'MessageOutlined',
	},
	{
		path: '/forum/search',
		name: 'Tìm kiếm nâng cao',
		component: './Forum/AdvancedSearch',

	},
	{
		path: '/forum/create',
		name: 'Tạo bài viết',
		component: './Forum/CreatePost',
		hideInMenu: true,
	},	{
		path: '/forum/:id',
		name: 'Chi tiết bài viết',
		component: './Forum/PostDetail',
		hideInMenu: true,
	},

	// CHAT ROUTES
	{
		path: '/chat',
		name: 'Chat toàn cầu',
		component: './Chat/GlobalChat',
		icon: 'WechatOutlined',
	},

	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];

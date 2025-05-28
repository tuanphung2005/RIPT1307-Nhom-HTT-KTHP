export default [
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
		icon: 'HomeOutlined',
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},

	// FORUM ROUTES
	{
		path: '/forum',
		name: 'Diễn đàn',
		component: './Forum',
		icon: 'MessageOutlined',
	},
	{
		path: '/forum/create',
		name: 'Tạo bài viết',
		component: './Forum/CreatePost',
		hideInMenu: true,
	},
	{
		path: '/forum/:id',
		name: 'Chi tiết bài viết',
		component: './Forum/PostDetail',
		hideInMenu: true,
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

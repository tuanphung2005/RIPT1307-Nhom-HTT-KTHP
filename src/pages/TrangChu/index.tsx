import { Card } from 'antd';
import './components/style.less';
import { unitName } from '@/services/base/constant';

const TrangChu = () => {

	return (
		<Card bodyStyle={{ height: '100%' }}>
			<div className='home-welcome'>
				<h1 className='title'>THỰC HÀNH LẬP TRÌNH WEB</h1>
				<h2 className='sub-title'>{unitName.toUpperCase()}</h2>
			</div>
		</Card>
	);
};

export default TrangChu;

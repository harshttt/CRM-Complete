import {Result, Button} from 'antd';
import { Link } from 'react-router-dom';


export default function ErrorJS(){
    return (
        <Result
         status={'warning'}
         title='There are some problems with your operation'
         extra={<Link to={'/'}><Button type='primary' key={'console'}>Go Console</Button></Link>}
        />
    )
}
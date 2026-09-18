import {Result, Button} from 'antd';
import { Link } from 'react-router-dom';


export default function Error401(){
    return (
        <Result
         status={'403'}
         title='401'
         subTitle='Sorry, you are not authorized to access this page'
         extra={<Link to={'/'}><Button>Back Home</Button></Link>}
        />
    )
}
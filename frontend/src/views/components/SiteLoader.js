import { Image } from "antd";
import logom from '../components/Assets/tire.svg';
import classes from './siteloader.module.css';


export default function SiteLoader(){
    return (
        <div className={classes.siteloader}>
            <div className={classes.main}>
                <div style={{zIndex:1, width:'70px', height:'70px', border:'16px solid transparent', borderRadius:'50%', borderTop:'16px solid white', animation:'spin 2s linear infinite'}}></div>
                {/* Inner Border */}
                <div style={{zIndex:1, width:'70px', height:'70px', border:'16px solid white', borderRadius:'50%', borderTop:'16px solid transparent', position:'absolute', top:0, left:0, animation:'spin2 2s linear infinite'}}></div>
                  {/* Center Image */}
                  <div className={classes.center}>
                    <Image src={logom} width={50} style={{animation:'spin 1s linear infinite'}} preview={false}/>
                  </div>
            </div>
        </div>
    )

}
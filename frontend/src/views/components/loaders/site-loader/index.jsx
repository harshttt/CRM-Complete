// import { Image } from "antd";
import "./index.css";

const MainSiteLoader = () => {
  return (
    <>
    <div className="main-generic">
      <div className="loader"></div>
    </div>
      {/* <div className="main-generic">
        <div className="glass-lightning-loader" style={{ width: 70, height: 70 }}>
         <div className="glass-lightning-beam"></div>
        </div>
       <div className="loading-text">loading...</div>
      </div> */}
    </>
  );
};

// const MainSiteLoader = () => {
//     return (
//      <div className={'siteloader'}>
//       <div className={'main'}>
//         <div
//           style={{
//             zIndex: 1,
//             width: "70px",
//             height: "70px",
//             border: "16px solid transparent",
//             borderRadius: "50%",
//             borderTop: "16px solid white",
//             animation: "spin 2s linear infinite"
//           }}
//         ></div>

//         <div
//           style={{
//             zIndex: 1,
//             width: "70px",
//             height: "70px",
//             border: "16px solid white",
//             borderRadius: "50%",
//             borderTop: "16px solid transparent",
//             position: "absolute",
//             top: 0,
//             left: 0,
//              animation: "spin2 2s linear infinite"
//           }}
//         ></div>

//         <div className={'center'}>
//           <Image src={'/tire.png'} width={50} style={{animation: "spin 1s linear infinite"}} preview={false} />
//         </div>
//       </div>
//     </div>
//     )
// }

export default MainSiteLoader;

// <div className='main-generic'>
//     <div className='loadingSpinner z-10'>
//         <div id='square1'></div>
//         <div id='square2'></div>
//         <div id='square3'></div>
//         <div id='square4'></div>
//         <div id='square5'></div>
//     </div>
// </div>

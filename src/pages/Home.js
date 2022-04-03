import React from 'react';
import { useState, useEffect } from 'react';

import { Link } from "react-router-dom";
import "./Home.css";
import { Logo } from '../images/Netflix';
// logo is a svg file
import { ConnectButton, Icon, TabList, Tab, Button, Modal, useNotification } from 'web3uikit';  
import { movies } from '../helpers/library';
import { useMoralis } from "react-moralis";

const Home = () => {
  const [visible, setVisible] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState();
  const { isAuthenticated, Moralis, account } = useMoralis();
  const [myMovies, setMyMovies] = useState();
//access the moralis database and the account connected to the current wallet
//through the moralis cloud function, pass the wallet address to get myList stored in Moralis
useEffect(() => {
  async function fetchMyList() {
     await Moralis.start({
        serverUrl: "https://9kptsobciedt.usemoralis.com:2053/server",
        appId: "9kXFbkhSfsYtrT6XhKF91PTB0Oafqr97t8qPTSnd",
      }); //if getting errors add this 

    try {
      const theList = await Moralis.Cloud.run("getMyList", { addrs: account });

      const filterdA = movies.filter(function (e) {
        return theList.indexOf(e.Name) > -1;
      });

      setMyMovies(filterdA);
      
    } catch (error) {
      console.error(error)
    }
  }

  fetchMyList();
}, [account]);

  const dispatch = useNotification();
  const handleNewNotification = () => {
    dispatch({
      type:"error",
      message:"Please connect your crypto wallet",
      title:"Not authenticated",
      position:"topL"
    })
  }

  const handleAddNotification = () => {
    dispatch({
      type:"success",
      message:"Movie Added to List",
      title:"Success",
      position:"topL"
    })
  }
  return(
    <>
    <div className='logo'>
      <Logo />
    </div>
    <div className='connect'>
      <Icon
        fill="#ffffff"
        size={24}
        svg="bell"
      />
      <ConnectButton />
    </div>
    <div className="topBanner">
      <TabList defaultActiveKey={1} tabStyle="bar">
        <Tab tabKey={1} tabName={"Movies"}>
          <div className='scene'>
            <img src={movies[0].Scene} className="sceneImg" alt="movie poster" />
            <img src={movies[0].Logo} className="sceneLogo" alt="" />
            <p className='sceneDesc'>{movies[0].Description}</p>
            <div className="playButton">
              <Button
                icon="chevronRightX2"
                text="Play"
                theme="secondary"
                type="button"
              />
              <Button
                icon="plus"
                text="Add to My List"
                theme="translucent"
                type="button"
                onClick={() => console.log(myMovies)}
              />
            </div>
          </div>

        <div className="title">
          Movie
        </div>
        <div className="thumbs">
          {movies && 
            movies.map((e) => {
              return(
                <img 
                  src={e.Thumnbnail} 
                  alt="thumbnails"
                  className="thumbnail" 
                  onClick={() => {
                    setSelectedFilm(e)
                    setVisible(true);
                  }}  
                />
              )
            })
          }
        </div>
        </Tab>
        <Tab tabKey={2} tabName={"Series"} isDisabled={true}></Tab>
        <Tab tabKey={3} tabName={"MyList"}>
          <div className="ownListContent">
            <div className="title">Your Library</div>
            {myMovies && isAuthenticated ? (
              <>
                <div className="ownthumbs">
                  {myMovies && 
                    myMovies.map((e) => {
                      return(
                        <img 
                          src={e.Thumnbnail} 
                          alt="thumbnails"
                          className="thumbnail" 
                          onClick={() => {
                            setSelectedFilm(e)
                            setVisible(true);
                          }}  
                        />
                      )
                    })
                  }
                </div>
              </>
            ) : (
            <div className="ownthumbs">
              You need to authenticate to view your own list
            </div>
            )}
          </div>
        </Tab>
      </TabList>
      { selectedFilm && (
        <div className='modal'>
          <Modal 
            onCloseButtonPressed = {() => setVisible(false)}
            isVisible={visible}
            hasFooter={false}
            width="1000px"
          >
          <div className="modalContent">
            <img src={selectedFilm.Scene} className="modalImg" alt="movie poster" />
            <img src={selectedFilm.Logo} className="modalLogo" alt="" />
            <div className="modalPlayButton">
              {/* if logined by wallet, show play and add; if not, remind to login */}
              {isAuthenticated ? (
                <>
                <Link to="/player" state={selectedFilm.Movie}>
                <Button
                  icon="chevronRightX2"
                  text="Play"
                  theme="secondary"
                  type="button"
                />
              </Link>
              <Button
                icon="plus"
                text="Add to My List"
                theme="translucent"
                type="button"
                onClick={async() => {
                  await Moralis.Cloud.run("updateMyList", {
                    addrs: account,
                    newFav: selectedFilm.Name
                  })
                  handleAddNotification();
                }}
              />
              </>
              ) : (
                <>
                  <Button
                    icon="chevronRightX2"
                    text="Play"
                    theme="secondary"
                    type="button"
                    onClick={handleNewNotification}
                  />
                  <Button
                    icon="plus"
                    text="Add to My List"
                    theme="translucent"
                    type="button"
                    onClick={handleNewNotification}
                  />
                </>
              )}
            </div>
            <div className="movieInfo">
              <div className="description">
                <div className="details">
                  <span>{selectedFilm.Year}</span>
                  <span>{selectedFilm.Duration}</span>
                </div>
                  {selectedFilm.Description}
              </div>
              <div className="detailedInfo">
                    Genre:
                  <span className="deets">{selectedFilm.Genre}</span>
                  <br />
                  Actors:
                  <span className="deets">{selectedFilm.Actors}</span>
              </div>
            </div>
          </div>
          </Modal>
        </div>
      )}
    </div>
    </>
  )
}

export default Home;

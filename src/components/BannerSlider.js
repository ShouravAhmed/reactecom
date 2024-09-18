import { useState, useRef, useEffect, useCallback } from "react";
import { Image } from "./Image";
import { useNavigate } from 'react-router-dom';


const BannerSlider = ({slides}) => {
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0)
    const timerRef = useRef(null);

    const goToNextSlide = useCallback(() => {
        setStartingX(0);
        setMovingX(0);
        setCurrentIndex((prv) => {
            return ((prv + 1 >= (slides ? slides.length : 0)) ? 0 : prv + 1);
        });
    }, [setCurrentIndex, slides]);

    const goToPreviousSlide = () => {
        setStartingX(0);
        setMovingX(0);
        setCurrentIndex((prv) => {
            return ((prv - 1 < 0) ? (slides ? slides.length : 1) - 1 : prv - 1);
        });
    }

    const [startingX, setStartingX] = useState(0);
    const [startingY, setStartingY] = useState(0);
    const [movingX, setMovingX] = useState(0);
    const [movingY, setMovingY] = useState(0);

    const touchStart = (e) => {
        e.stopPropagation();
        setStartingX(e.touches[0].clientX);
        setStartingY(e.touches[0].clientY);
    }
    const touchMove = (e) => {
        setMovingX(e.touches[0].clientX);
        setMovingY(e.touches[0].clientY);
    }

    const touchEnd = () => {
        if(movingX === 0 || startingX === 0) return;
        if(startingX+100 < movingX) {
            goToPreviousSlide();
        }
        else if(startingX-100 > movingX) {
            goToNextSlide();
        }
    }

    useEffect(() => {
        if(timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            goToNextSlide();
        }, 3500);
        return () => clearTimeout(timerRef.current);
    }, [currentIndex, goToNextSlide]);

    return (
        <div onClick={(e) => {
                e.stopPropagation();
                console.log('=>> banner catagory:', slides[currentIndex].redirect_url);
                navigate(`/category/${slides[currentIndex].redirect_url}`);
            }}  
            onTouchStart={touchStart}
            onTouchMove={touchMove}
            onTouchEnd={touchEnd}>
            {
                slides && (currentIndex < slides.length) &&
                <Image 
                    imageUrl={`${process.env.REACT_APP_BACKEND_SERVER}/${slides[currentIndex].image}`} 
                    altText={""}
                    blurHash={slides[currentIndex].image_blurhash}
                    width={"100%"}
                    height={"250px"}
                    blurHashWidth={"400px"}
                    blurHashHeight={"250px"}
                    borderRadius={"10px"}/>
            }
        </div>
    );
}

export default BannerSlider;
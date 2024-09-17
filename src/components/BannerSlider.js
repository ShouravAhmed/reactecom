import { useState, useRef, useEffect, useCallback } from "react";
import { Image } from "./Image";


const BannerSlider = ({slides}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const timerRef = useRef(null);

    const goToNextSlide = useCallback(() => {
        setCurrentIndex((prv) => {
            return ((prv + 1 >= (slides ? slides.length : 0)) ? 0 : prv + 1);
        });
    }, [setCurrentIndex, slides]);

    const goToPreviousSlide = () => {
        setCurrentIndex((prv) => {
            return ((prv - 1 < 0) ? (slides ? slides.length : 1) - 1 : prv - 1);
        });
    }

    const [startingX, setStartingX] = useState(0);
    const [startingY, setStartingY] = useState(0);
    const [movingX, setMovingX] = useState(0);
    const [movingY, setMovingY] = useState(0);

    const touchStart = (e) => {
        setStartingX(e.touches[0].clientX);
        setStartingY(e.touches[0].clientY);
    }
    const touchMove = (e) => {
        setMovingX(e.touches[0].clientX);
        setMovingY(e.touches[0].clientY);
    }

    const touchEnd = () => {
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
        <div onTouchStart={touchStart}
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
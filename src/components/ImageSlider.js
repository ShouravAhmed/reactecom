import { useState, useRef, useEffect, useCallback } from "react";
import { Image } from "./Image";
import Axios from "axios";

import { useQuery } from 'react-query';

const axiosInstance = Axios.create({
    baseURL: "http://127.0.0.1:8000/api/product/",
});
  
const ImageSlider = ({productId}) => {
    const [productImages, setProductImages] = useState([]);

    const productImagesrResponse = useQuery(`product-photos-${productId}`, async () => {
        return axiosInstance.get(`image/product/${productId}`);
    }, { 
        staleTime: (60) * (60 * 1000),
        cacheTime: (6 * 60) * (60 * 1000),
    });

    useEffect(() => {
        if(!productImagesrResponse.isLoading && productImagesrResponse.data && productImagesrResponse.data.data && productImagesrResponse.data.data.length > 0) {
            setProductImages(productImagesrResponse.data.data);
        }
    }, [productImagesrResponse.isLoading, productImagesrResponse.data]);

    useEffect(() => {
        console.log("productImages:", productImages);
    }, [productImages]);

    const [currentIndex, setCurrentIndex] = useState(0)

    const goToNextSlide = useCallback(() => {
        setCurrentIndex((prv) => {
            return ((prv + 1 >= (productImages ? productImages.length : 0)) ? 0 : prv + 1);
        });
    }, [setCurrentIndex, productImages]);

    const goToPreviousSlide = () => {
        setCurrentIndex((prv) => {
            return ((prv - 1 < 0) ? (productImages ? productImages.length : 1) - 1 : prv - 1);
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

    return (
        <div>
            <div onTouchStart={touchStart}
                onTouchMove={touchMove}
                onTouchEnd={touchEnd}
                style={{height: '390px'}}>
                {
                    productImages && (currentIndex < productImages.length) &&
                    <Image 
                        imageUrl={'http://127.0.0.1:8000/' + productImages[currentIndex].image} 
                        altText={""}
                        blurHash={productImages[currentIndex].image_blurhash}
                        width={"100%"}
                        height={"390px"}
                        blurHashWidth={"400px"}
                        blurHashHeight={"390px"}
                        borderRadius={"0px"}/>
                }
            </div>

            <div className="ImageSliderDotContainer">
                {productImages.map((slide, slideIndex) => (
                    <div key={slideIndex} className={slideIndex === currentIndex ? "ImageSliderSelectedDot" : "ImageSliderDot"} onClick={() => {setCurrentIndex(slideIndex)}}>•</div>
                ))}
            </div>
        </div>
    );
}

export default ImageSlider;
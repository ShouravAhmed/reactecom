import React from "react";
import { Blurhash } from "react-blurhash";

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <Blurhash hash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                width={400}
                height={300}
                resolutionX={32}
                resolutionY={32}
                punch={1}/>
        </div>
    );
}

export default Home;
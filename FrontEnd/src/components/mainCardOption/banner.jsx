function Banner({text, detail}) {
    console.log(text)
    return(
        <>
            <div className="w-fit p-2 bg-gray-200 rounded-lg">{text} {detail}</div>
        </>
    )


}

export default Banner;
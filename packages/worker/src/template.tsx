import React from "react";

export const template = ({
  title,
  logoSrc,
  authorSrc,
  author,
  backgroundImage,
  imageSrc,
}: {
  title: string;
  logoSrc: string;
  authorSrc: string;
  author: string;
  backgroundImage: string;
  imageSrc?: string | null;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      height: "100vh",
      width: "100vw",
      backgroundImage,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: "0 0 60%",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "80px 80px 10px 80px",
        }}
      >
        <img src={logoSrc} width="80" height="80" />
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "flex-end",
          width: "100%",
          padding: "10px 80px 80px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <h1
            style={{
              fontSize: 56,
              margin: 0,
              fontFamily: "Bitter",
              fontWeight: 500,
              color: "#fff",
            }}
          >
            {title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                borderRadius: "50%",
                width: 40,
                height: 40,
                overflow: "hidden",
              }}
            >
              <img src={authorSrc} width="40" height="40" />
            </div>
            <span
              style={{
                marginLeft: 20,
                fontFamily: "Bitter",
                fontWeight: 500,
                fontSize: 24,
                color: "#fff",
              }}
            >
              {author}
            </span>
          </div>
        </div>
      </div>
    </div>
    {imageSrc && (
      <div style={{ display: "flex", height: "100%", flex: "0 0 40%" }}>
        <img src={imageSrc} alt="" width={480} height={630} />
      </div>
    )}
  </div>
);

import Head from "next/head";
import NavBar from "@/components/UI/NavBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function () {
  const { query, isReady } = useRouter();
  const id = query.id as string;

  const [theme, setTheme] = useState<any>();
  const [chapter, setChapter] = useState<any>();

  useEffect(() => {
    const chapterFromLocalStorage = JSON.parse(
      // @ts-ignore
      localStorage.getItem(`chapter_${id}`)
    );
    setChapter(chapterFromLocalStorage);
  }, [isReady]);

  const changeTheme = () => {
    const att = document.createAttribute("data-app-theme");
    if (theme === "light") {
      att.value = "dark";
      setTheme("dark");
    } else {
      att.value = "light";
      setTheme("light");
    }

    // @ts-ignore
    document.querySelector("main").setAttributeNode(att);
  };

  return (
    <>
      <Head>
        <title>Редактирование главы {chapter?.id}</title>
        <meta name="description" content="Редактор главы" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="main">
        <NavBar>
          <button className="navbar__header navbar__header--active">
            Глава
          </button>
          <button className="navbar__header">Карта</button>
          <button className="mx-auto"></button>
          <button className="navbar__header" onClick={changeTheme}>
            Сменить тему :)
          </button>
          <button className="navbar__header">Помощь</button>
        </NavBar>
        <hr />
        <NavBar>
          <button className="navbar__header">Создать стадию</button>
        </NavBar>
        <div className="stage-body">
          <div className="stage-parent" id="stage-main">
            {chapter &&
              chapter.stages.map((stage: any) => (
                <div className="stage-card" id="stage" key={stage?.id}>
                  <h2>Стадия {stage?.id}</h2>
                  {stage?.message}
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}

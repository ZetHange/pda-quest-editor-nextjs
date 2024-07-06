import { createBrowserRouter } from "react-router-dom";
import { StoriesEditor } from "@/pages/story";
import { StoryEditor } from "@/pages/chapter";
import { ChapterEditor } from "@/pages/chapter-editor";
import { MapsEditor } from "@/pages/maps";
import UI from "@/pages/ui/ui";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StoriesEditor />,
  },
  {
    path: "/edit/story/:id",
    element: <StoryEditor />,
  },
  {
    path: "/edit/story/:storyId/chapter/:chapterId",
    element: <ChapterEditor />,
  },
  { path: "/edit/story/:storyId/maps", element: <MapsEditor /> },
  {
    path: "/ui",
    element: <UI />,
  },
]);

export default router;

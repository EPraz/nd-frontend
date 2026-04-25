import { Redirect, useLocalSearchParams } from "expo-router";

function Edit() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  return (
    <Redirect
      href={`/projects/${String(projectId)}/vessels/${String(assetId)}/maintenance`}
    />
  );
}

export default Edit;

import { NextRequest } from "next/server";
import { getCommunityFromHeaders } from "../../../services/config";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  const headersList = request.headers;

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return new Response("Community not found", { status: 404 });
  }

  const alias = config.community.alias;

  // Construct the file path using the community alias in the communities directory
  const filePath = path.join(
    process.cwd(),
    "src",
    "app",
    ".well-known",
    alias,
    ...pathSegments
  );

  console.log("filePath", filePath);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return new Response("File not found", { status: 404 });
  }

  // Read the file content
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Determine content type based on file extension
  const ext = path.extname(filePath).toLowerCase();
  let contentType = "text/plain";

  if (ext === ".json") {
    contentType = "application/json";
  } else if (ext === ".txt") {
    contentType = "text/plain";
  } else if (ext === ".html") {
    contentType = "text/html";
  } else if (ext === ".css") {
    contentType = "text/css";
  } else if (ext === ".js") {
    contentType = "application/javascript";
  } else if (ext === ".png") {
    contentType = "image/png";
  } else if (ext === ".jpg" || ext === ".jpeg") {
    contentType = "image/jpeg";
  } else if (ext === ".svg") {
    contentType = "image/svg+xml";
  }

  // Return the file with appropriate content type
  return new Response(fileContent, {
    headers: {
      "Content-Type": contentType,
    },
  });
}

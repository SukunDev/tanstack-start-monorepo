export const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px">
    <div style="max-width:600px;margin:auto;background:#fff;padding:24px">
      ${content}
    </div>
  </body>
</html>
`;

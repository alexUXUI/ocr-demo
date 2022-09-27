export const Frames = ({ vidFrames, isOCRProcessing }) => {
  if (isOCRProcessing) {
    return <h1>Post Processing Video</h1>;
  }

  if (!vidFrames) return;

  if (vidFrames.length === 0) {
    return <h1>No Frames Found</h1>;
  }

  if (!vidFrames?.length) {
    return <h1>Processing</h1>;
  }

  return (
    <table style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Full Image</th>
          <th>Frame Counter Image</th>
          <th>Text</th>
        </tr>
      </thead>

      <tbody>
        {vidFrames &&
          vidFrames.length > 0 &&
          vidFrames
            .sort((a, b) => {
              return a.timestamp - b.timestamp;
            })
            .map((frame, idx) => {
              console.log('frame', frame);
              return (
                <tr key={idx}>
                  <td>{frame.timestamp}</td>
                  <td>
                    <img src={frame.fullImage} style={{ maxHeight: 200 }} />
                  </td>
                  <td>
                    <img
                      src={frame.frameCounterImage}
                      width={frame.width}
                      height={frame.height}
                    />
                  </td>
                  <td>
                    <h1>{frame.text}</h1>
                  </td>
                </tr>
              );
            })}
      </tbody>
    </table>
  );
};

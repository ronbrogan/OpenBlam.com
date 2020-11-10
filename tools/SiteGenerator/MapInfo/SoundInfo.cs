namespace OpenBlam.SiteGenerator.MapInfo
{
    public record SoundInfo
    (
        string Identifier,
        string Entity,
        ClipInfo[] Clips
    );

    public record ClipInfo(string Id, string Transcription);
}

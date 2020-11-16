﻿using OpenH2.Core.Enums.Texture;
using OpenH2.Core.Extensions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace MapDetailsGenerator
{
    public class DdsHeader
    {
        public const int Magic = 0x20534444; // "DDS "
        public static int Length = 128;
        private static DdsFlags DefaultFlags = DdsFlags.Caps | DdsFlags.Height | DdsFlags.Width | DdsFlags.PixelFormat;

        public Stream HeaderData = new MemoryStream(128);

        public DdsHeader(TextureFormat format, TextureType type, int width, int height, int? depth, int? mipMapCount, int? pitch, int? linearSize)
        {
            HeaderData.WriteInt32(Magic);
            HeaderData.WriteInt32(Length - 4); // Remove 4 from length for magic size
            var flags = DefaultFlags;
            if (depth.HasValue)
                flags |= DdsFlags.Depth;
            if (mipMapCount.HasValue)
                flags |= DdsFlags.MipMapCount;
            if (pitch.HasValue)
                flags |= DdsFlags.Pitch;
            if (linearSize.HasValue)
                flags |= DdsFlags.LinearSize;

            HeaderData.WriteInt32((int)flags);
            HeaderData.WriteInt32(height);
            HeaderData.WriteInt32(width);
            HeaderData.WriteInt32((pitch ?? linearSize).GetValueOrDefault());
            HeaderData.WriteInt32(depth.GetValueOrDefault());
            HeaderData.WriteInt32(mipMapCount.GetValueOrDefault() == 0 ? 1 : mipMapCount.GetValueOrDefault());
            HeaderData.Write(new byte[44], 0, 44);

            var pixelFormat = new DdsPixelFormat(format);
            pixelFormat.Data.CopyTo(HeaderData);

            var caps = CapsLookup[type];
            if (flags.HasFlag(DdsFlags.MipMapCount))
                caps |= Caps.MipMap;
            HeaderData.WriteInt32((int)caps);
            HeaderData.WriteInt32((int)Caps2Lookup[type]);
            HeaderData.WriteInt32(0); // Caps3 (unused)
            HeaderData.WriteInt32(0); // Caps4 (unused)
            HeaderData.WriteInt32(0); // Reserved

            HeaderData.Seek(0, SeekOrigin.Begin);
        }

        [Flags]
        private enum DdsFlags
        {
            Caps = 0x1,
            Height = 0x2,
            Width = 0x4,
            Pitch = 0x8,
            PixelFormat = 0x1000,
            MipMapCount = 0x20000,
            LinearSize = 0x80000,
            Depth = 0x800000
        }

        [Flags]
        private enum Caps
        {
            Complex = 0x8,
            MipMap = 0x400000,
            Texture = 0x1000
        }

        private Dictionary<TextureType, Caps> CapsLookup = new Dictionary<TextureType, Caps>
        {
            { TextureType.Cubemap, Caps.Texture | Caps.Complex },
            { TextureType.Sprite, Caps.Texture },
            { TextureType.ThreeDimensional, Caps.Texture | Caps.Complex },
            { TextureType.TwoDimensional, Caps.Texture },
            { TextureType.UI, Caps.Texture },
        };

        [Flags]
        private enum Caps2
        {
            Cubemap = 0x200,
            CubemapPositiveX = 0x400,
            CubemapNegativeX = 0x800,
            CubemapPositiveY = 0x1000,
            CubemapNegativeY = 0x2000,
            CubemapPositiveZ = 0x4000,
            CubemapNegativeZ = 0x8000,
            Volume = 0x200000
        }

        private Dictionary<TextureType, Caps2> Caps2Lookup = new Dictionary<TextureType, Caps2>
        {
            { TextureType.Cubemap, Caps2.Cubemap },
            { TextureType.Sprite, (Caps2)0 },
            { TextureType.ThreeDimensional, Caps2.Volume },
            { TextureType.TwoDimensional, (Caps2)0 },
            { TextureType.UI, (Caps2)0 },
        };

        private class DdsPixelFormat
        {
            public Stream Data = new MemoryStream(32);

            public DdsPixelFormat(TextureFormat format)
            {
                Data.WriteInt32(32);
                Data.WriteInt32((int)FlagLookup[format]);
                Data.Write(Encoding.ASCII.GetBytes(FourCCLookup[format]), 0, 4);
                Data.WriteInt32(BppLookup[format]);

                var masks = RgbaMaskLookup[format];
                Data.WriteUInt32(masks.Item1);
                Data.WriteUInt32(masks.Item2);
                Data.WriteUInt32(masks.Item3);
                Data.WriteUInt32(masks.Item4);

                Data.Seek(0, SeekOrigin.Begin);
            }

            private static Dictionary<TextureFormat, PixelFormatFlags> FlagLookup = new Dictionary<TextureFormat, PixelFormatFlags>
            {
                { TextureFormat.A8, PixelFormatFlags.Alpha },
                { TextureFormat.L8, PixelFormatFlags.Luminance },
                { TextureFormat.A8L8, PixelFormatFlags.Luminance | PixelFormatFlags.AlphaPixels},
                { TextureFormat.R5G6B5, PixelFormatFlags.UncompressedRGB },
                { TextureFormat.U8V8, PixelFormatFlags.BumpDuDv },
                { TextureFormat.A4R4G4B4, PixelFormatFlags.UncompressedRGB | PixelFormatFlags.AlphaPixels },
                { TextureFormat.R8G8B8, PixelFormatFlags.UncompressedRGB },
                { TextureFormat.A8R8G8B8, PixelFormatFlags.UncompressedRGB | PixelFormatFlags.AlphaPixels },
                { TextureFormat.DXT1, PixelFormatFlags.CompressedRGB  },
                { TextureFormat.DXT23,PixelFormatFlags.CompressedRGB  },
                { TextureFormat.DXT45,PixelFormatFlags.CompressedRGB  },
            };

            private static Dictionary<TextureFormat, string> FourCCLookup = new Dictionary<TextureFormat, string>
            {
                { TextureFormat.A8, "\0\0\0\0"},
                { TextureFormat.L8, "\0\0\0\0"},
                { TextureFormat.A8L8, "\0\0\0\0"},
                { TextureFormat.U8V8, "\0\0\0\0" },
                { TextureFormat.R5G6B5, "\0\0\0\0" },
                { TextureFormat.A4R4G4B4, "\0\0\0\0"},
                { TextureFormat.R8G8B8, "\0\0\0\0"},
                { TextureFormat.A8R8G8B8, "\0\0\0\0"},
                { TextureFormat.DXT1, "DXT1" },
                { TextureFormat.DXT23, "DXT3" },
                { TextureFormat.DXT45, "DXT5" },
            };

            private static Dictionary<TextureFormat, int> BppLookup = new Dictionary<TextureFormat, int>
            {
                { TextureFormat.A8, 8},
                { TextureFormat.L8, 8},
                { TextureFormat.A8L8, 16},
                { TextureFormat.U8V8, 16 },
                { TextureFormat.R5G6B5, 16 },
                { TextureFormat.A4R4G4B4, 16},
                { TextureFormat.R8G8B8, 32},
                { TextureFormat.A8R8G8B8, 32},
                { TextureFormat.DXT1, 0 },
                { TextureFormat.DXT23, 0 },
                { TextureFormat.DXT45, 0 },
            };

            private static Dictionary<TextureFormat, (uint, uint, uint, uint)> RgbaMaskLookup = new Dictionary<TextureFormat, (uint, uint, uint, uint)>
            {
                { TextureFormat.A8, (0x00, 0x00, 0x00, 0xff)},
                { TextureFormat.L8, (0xff, 0x00, 0x00, 0x00)},
                { TextureFormat.A8L8, (0x00ff, 0x0000, 0x0000, 0xff00)},
                { TextureFormat.U8V8, (0x00ff, 0xff00, 0x0000, 0x0000)},
                { TextureFormat.R5G6B5, (0x0000f800, 0x000007e0, 0x0000001f, 0x00000000) },
                { TextureFormat.A4R4G4B4, (0x00000f00, 0x000000f0, 0x0000000f, 0x0000f000)},
                { TextureFormat.R8G8B8, (0x00ff0000, 0x0000ff00, 0x000000ff, 0x00000000)},
                //{ TextureFormat.A8R8G8B8, (0x00ff0000, 0x0000ff00, 0x000000ff, 0xff000000)},
                { TextureFormat.A8R8G8B8, (0xff000000, 0x00ff0000, 0x0000ff00, 0x000000ff)},
                { TextureFormat.DXT1, (0, 0, 0, 0) },
                { TextureFormat.DXT23, (0, 0, 0, 0) },
                { TextureFormat.DXT45, (0, 0, 0, 0) },
            };

            [Flags]
            private enum PixelFormatFlags
            {
                AlphaPixels = 0x1,
                Alpha = 0x2,
                CompressedRGB = 0x4, // Dictates that FourCC is provided
                UncompressedRGB = 0x40, // Count and maks contain data
                Yuv = 0x200, // Count and maks contain data
                Luminance = 0x2000,
                BumpDuDv = 0x00080000
            }
        }
    }
}
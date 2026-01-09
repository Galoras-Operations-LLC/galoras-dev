import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, coachId } = await req.json();

    if (!imageUrl || !coachId) {
      throw new Error("imageUrl and coachId are required");
    }

    console.log("Processing background removal for coach:", coachId);

    // Fetch the image and convert to base64
    let imageBase64: string;
    
    if (imageUrl.startsWith("data:")) {
      imageBase64 = imageUrl;
    } else {
      // Construct full URL if it's a relative path
      const fullUrl = imageUrl.startsWith("http") 
        ? imageUrl 
        : `${Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "")}${imageUrl}`;
      
      console.log("Fetching image from:", fullUrl);
      
      const imageResponse = await fetch(fullUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      
      const imageBlob = await imageResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBlob)));
      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      imageBase64 = `data:${contentType};base64,${base64}`;
    }

    console.log("Image fetched, sending to AI for background removal...");

    // Use Lovable AI to remove background
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Remove the background from this image completely. Make the background fully transparent. Keep only the person/subject with clean edges. Output a PNG with transparent background.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    const cutoutBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!cutoutBase64) {
      console.error("No image in AI response:", JSON.stringify(aiData));
      throw new Error("No image returned from AI");
    }

    // Upload the cutout to Supabase Storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Convert base64 to blob
    const base64Data = cutoutBase64.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const fileName = `cutouts/${coachId}-cutout.png`;

    const { error: uploadError } = await supabase.storage
      .from("coach-avatars")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload cutout: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("coach-avatars")
      .getPublicUrl(fileName);

    const cutoutUrl = publicUrlData.publicUrl;
    console.log("Cutout uploaded to:", cutoutUrl);

    // Update coach record
    const { error: updateError } = await supabase
      .from("coaches")
      .update({ cutout_url: cutoutUrl })
      .eq("id", coachId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update coach: ${updateError.message}`);
    }

    console.log("Coach record updated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        cutoutUrl,
        message: "Background removed successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});

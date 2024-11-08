<script lang="ts">
	export let dotSize: number = 1.2
	export let dotColor: string = '#fa98aa'
	export let backgroundColor: string = '#ffffff'
	export let gap: number = 15
	export let fade: boolean = true
	export let className: string = ''
	export let style: Record<string, any> = {}
	export let additionalProps = {}

	// Encode dotColor for use in SVG
	const encodedDotColor = encodeURIComponent(dotColor)

	// Define mask style if fading effect is enabled
	const maskStyle = fade
		? {
				maskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
				WebkitMaskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
			}
		: {}

	// Combine all styles including mask, background SVG pattern, and other passed styles
	$: backgroundStyle = {
		backgroundColor,
		backgroundImage: `url("data:image/svg+xml,%3Csvg width='${gap}' height='${gap}' viewBox='0 0 ${gap} ${gap}' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodedDotColor}' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='${dotSize}' cy='${dotSize}' r='${dotSize}'/%3E%3C/g%3E%3C/svg%3E")`,
		...maskStyle,
		...style,
	}

	// Convert backgroundStyle object to a CSS string
	$: styleString = Object.entries(backgroundStyle)
		.map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
		.join('; ')
</script>

<div
	class={`absolute z-[-50] h-full w-full ${className}`}
	style={styleString}
	{...additionalProps}
></div>

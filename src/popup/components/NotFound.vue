<template>
	<c-flex
		v-if="isEmpty"
		align="center"
		height="70%"
		width="100%"
		justify="center"
	>
		<c-flex direction="column" align="center">
			<c-icon name="ghost" size="50px" mb="4" />
			<c-text fontSize="lg">No meeting was found !</c-text>
		</c-flex>
	</c-flex>
</template>
<script>
import { CFlex, CText, CIcon } from '@chakra-ui/vue';
export default {
	name: 'NotFound',
	props: ['isEmpty'],
	components: {
		CFlex,
		CText,
		CIcon,
	},
};
</script>

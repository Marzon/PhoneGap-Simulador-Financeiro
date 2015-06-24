$(function () {
	$('.money2').mask("#.##0,00", {reverse: true});
	msg('Informe os dados acima e clique em Simular');
	$('#nome').on('keyup', function () { 
		$('#nome_duvida').val($(this).val());
	});
	$('#nome_duvida').on('keyup', function () { 
		$('#nome').val($(this).val());
	});
	
	$('#email').on('keyup', function () { 
		$('#email_duvida').val($(this).val());
	});
	$('#email_duvida').on('keyup', function () { 
		$('#email').val($(this).val());
	});

	$('#enviar').on('click', function (event) {
		event.preventDefault();
		if ($('#nome_duvida').val() == '') {
			alert('Preencha todos os dados antes de enviar');
			return false;
		}
		if ($('#email_duvida').val() == '') {
			alert('Preencha todos os dados antes de enviar');
			return false;
		}
		if ($('#telefone').val() == '') {
			alert('Preencha todos os dados antes de enviar');
			return false;
		}
		$.post('/form/send.php',$('#formduvida').serialize()).done(alert('Entraremos em contato em breve!'));
	});
        
        $('#simular').on('click', function () { 
                montarGrafico();	
	});

        
	montarGrafico();
});

function msg(mensagem) {
	$('#msg').html(mensagem);
}

function montarGrafico() {
	var tempo = $('#prazo').val();
	var imposto_renda = (((((tempo) <= (0))) ? (1) : (((((tempo) <= (6))) ? (0.225) : ((((tempo) <= (12))) ? (0.2) : (((((tempo) <= (24))) ? (0.175) : ((((tempo) > (24))) ? (0.15) : (1)))))))));
	var taxa_di_ano = trataPercentual($('#di_ano').val());
	var taxa_di_mes = (((Math.pow((((1)+(taxa_di_ano/100))),(((1)/(12)))))-(1)))+1;
	var taxa_poupanca_mes = 1.0056;
	var valor_inicial = parseFloat(trataDinheiro($('#investimento').val()));
	
	var valor_menor = 9999999999999999999;
	var valor_maior = 0;
	
	msg('Resultado');
	
	var options = {
		title: {
			text: ""
		},
		toolTip: {
			shared: true,
			content: function (e) {
				var content = "<strong>"+e.entries[0].dataPoint.label + "</strong><br/><table>";
				e.entries.sort(function(a, b){return b.dataPoint.y - a.dataPoint.y});
				for (var i = 0; i < e.entries.length; i++) {
					content += "<tr><td><span style='color: "+e.entries[i].dataSeries.color+";'>"+e.entries[i].dataSeries.name + "</span></td><td>" + "<strong>R$ " + formatReal(e.entries[i].dataPoint.y, 2, ',', '.') + "</strong></td>";
					content += "</tr>";
				}
				return content;
			}
		},
		axisY:{
			minimum: (valor_inicial-1),
			valueFormatString: "R$ 0"
		},
		axisX:{
			valueFormatString: "R$ 0.00"
		},
        animationEnabled: true,
	};

	var cdi = { // base
        type: "spline",
        name: "CDI",
        showInLegend: true
    };

	options.data = [];
	//options.data.push(cdi);
    //options.data.push(series2);

	

	cdi.dataPoints = [];
	var valor_calculo = valor_inicial;
	for (var i = 0; i<= tempo; i++) {
		cdi.dataPoints.push({ label: 'Mês '+i, y: valor_calculo})
		valor_calculo = valor_calculo * taxa_di_mes;
	}
	
	if ($('#c_poupanca').prop('checked')) {
		var poupanca = { 
			type: "spline",
			name: "Poupança",
			showInLegend: true
		};
		poupanca.dataPoints = [];	
		var valor_calculo = valor_inicial;
		for (var i = 0; i<= tempo; i++) {
			poupanca.dataPoints.push({ label: 'Mês '+i, y: valor_calculo})
			valor_calculo = valor_calculo * taxa_poupanca_mes;
		}
		if (valor_calculo < valor_menor) {
			valor_menor = valor_calculo;
		}
		if (valor_calculo > valor_maior) {
			valor_maior = valor_calculo;
		}
		options.data.push(poupanca);
	}
	
	if ($('#c_cdb').prop('checked')) {
		var taxa_cdb_mes = ((parseFloat($('#p_cdb').val())/100*(taxa_di_mes-1)) * (1 - imposto_renda)) + 1;
		//var c2F4 = (((((Math.pow((((1) + (((c2F2) * (c2C4))))), (c2C1))) - (1))) * (((1) - (c2C22)))));
		var cdb = { 
			type: "spline",
			//toolTipContent: "<span style='\"'color: {color};'\"'>{name}</span> <strong>{y}</strong>",
			name: "CDB",
			showInLegend: true
		};
		cdb.dataPoints = [];	
		var valor_calculo = valor_inicial;
		for (var i = 0; i<= tempo; i++) {
			cdb.dataPoints.push({ label: 'Mês '+i, y: valor_calculo})
			valor_calculo = valor_calculo * taxa_cdb_mes;
		}
		if (valor_calculo < valor_menor) {
			valor_menor = valor_calculo;
		}
		if (valor_calculo > valor_maior) {
			valor_maior = valor_calculo;
		}
		options.data.push(cdb);
	}
	
	
	if ($('#c_lca').prop('checked')) {
		var taxa_lca_mes = (parseFloat($('#p_lca').val())/100*(taxa_di_mes-1))+1;
		var lca = { //dataSeries - second quarter
			type: "spline",
			name: "LCA/LCI",
			showInLegend: true
		};
		lca.dataPoints = [];	
		var valor_calculo = valor_inicial;
		for (var i = 0; i<= tempo; i++) {
			lca.dataPoints.push({ label: 'Mês '+i, y: valor_calculo})
			valor_calculo = valor_calculo * taxa_lca_mes;
		}
		if (valor_calculo < valor_menor) {
			valor_menor = valor_calculo;
		}
		if (valor_calculo > valor_maior) {
			valor_maior = valor_calculo;
		}
		options.data.push(lca);
	}
	
	
	if ($('#c_letra').prop('checked')) {
		var taxa_letra_mes = (parseFloat($('#p_letra').val())/100*(taxa_di_mes-1))+1;
		var letra = { //dataSeries - second quarter
			type: "spline",
			name: "Letra",
			showInLegend: true
		};
		letra.dataPoints = [];	
		var valor_calculo = valor_inicial;
		for (var i = 0; i<= tempo; i++) {
			letra.dataPoints.push({ label: 'Mês '+i, y: valor_calculo})
			valor_calculo = valor_calculo * taxa_letra_mes;
		}
		if (valor_calculo < valor_menor) {
			valor_menor = valor_calculo;
		}
		if (valor_calculo > valor_maior) {
			valor_maior = valor_calculo;
		}
		options.data.push(letra);
	}
	
    if ($('#c_tesouro').prop('checked')) {
		var taxa_tesouro_mes = (parseFloat(100)/100*(taxa_di_mes-1)) * (1 - imposto_renda)+1;
		
		var tesouro = { //dataSeries - second quarter
			type: "spline",
			name: "Tesouro",
			showInLegend: true
		};
		tesouro.dataPoints = [];	
		var valor_calculo = valor_inicial;
		for (var i = 0; i<= tempo; i++) {
			tesouro.dataPoints.push({ label: 'Mês '+i, y: valor_calculo})
			valor_calculo = valor_calculo * taxa_tesouro_mes;
		}
		if (valor_calculo < valor_menor) {
			valor_menor = valor_calculo;
		}
		if (valor_calculo > valor_maior) {
			valor_maior = valor_calculo;
		}
		options.data.push(tesouro);
	}
	
	$('#diferenca').html('R$ ' + formatReal(valor_maior - valor_menor, 2, ',', '.'));
	$("#chartContainer").CanvasJSChart(options);
}

function formatReal (n, c, d, t) {
            var c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}

function trataPercentual(texto) {
	texto = texto.replace('%','');
	texto = texto.replace(',','.');
	return texto;
}

function trataDinheiro(texto) {
	texto = texto.split('.').join("");
	texto = texto.split(',').join(".");
	return texto;
}
